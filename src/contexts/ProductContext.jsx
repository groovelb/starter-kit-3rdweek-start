import { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { products as localProducts } from '../data/products';

/**
 * ProductContext
 * 제품 데이터를 전역으로 관리하는 컨텍스트
 *
 * 동작 방식:
 * 1. 앱 시작 시 로컬 제품 데이터를 로드
 * 2. Context에 캐싱하여 모든 컴포넌트에서 재사용
 *
 * 사용처:
 * - ProductShowcase: 전체 제품 목록 표시
 * - ProductDetailRoute: ID로 단일 제품 조회
 */

const ProductContext = createContext(null);

/**
 * ProductProvider
 *
 * Props:
 * @param {ReactNode} children - 자식 컴포넌트 [Required]
 *
 * 제공하는 값:
 * - products: 전체 제품 목록
 * - isLoading: 로딩 상태
 * - error: 에러 메시지
 * - getProductById: ID로 제품 조회하는 헬퍼 함수
 * - refetch: 데이터 새로고침 함수
 */
export function ProductProvider({ children }) {
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const loadedRef = useRef(false);

  /**
   * 제품 데이터 로드
   * 로컬 데이터에서 제품을 가져와 변환
   */
  const loadProducts = useCallback(() => {
    // 이미 로드됐으면 스킵
    if (loadedRef.current) {
      return;
    }

    loadedRef.current = true;
    setIsLoading(true);

    try {
      // 로컬 데이터를 Context 형식으로 변환
      const transformedProducts = (localProducts || []).map((product) => ({
        id: String(product.id),
        title: product.title,
        type: product.type,
        lux: product.lux,
        kelvin: product.kelvin,
        images: product.images || [],
        video: product.video,
        price: product.price || 1290,
        description: product.description,
      }));

      setProducts(transformedProducts);
      setError(null);
    } catch (err) {
      console.error('[ProductContext] Error loading products:', err);
      setError(err?.message || 'Failed to load products');
      setProducts([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * 최초 마운트 시 제품 데이터 로드
   */
  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  /**
   * ID로 제품 조회
   * @param {string} id - 제품 ID
   * @returns {Object|null} 제품 데이터 또는 null
   */
  const getProductById = useCallback(
    (id) => {
      return products.find((product) => product.id === String(id)) || null;
    },
    [products]
  );

  const value = {
    products,
    isLoading,
    error,
    getProductById,
    refetch: loadProducts,
  };

  return (
    <ProductContext.Provider value={value}>
      {children}
    </ProductContext.Provider>
  );
}

/**
 * useProduct Hook
 * @returns {Object} ProductContext 값
 */
export function useProduct() {
  const context = useContext(ProductContext);

  if (!context) {
    throw new Error('useProduct must be used within a ProductProvider');
  }

  return context;
}

export default ProductContext;
