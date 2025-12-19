import { BrowserRouter, Routes, Route, useParams, useNavigate } from 'react-router-dom';
import { useCallback } from 'react';
import { TimelineProvider } from './hooks/useTimeline';
import { CartProvider } from './context/CartContext';
import { ProductProvider, useProduct } from './contexts/ProductContext';
import { AppShell } from './components/navigation/AppShell';
import LandingPage from './pages/LandingPage';
import ProductDetailPage from './pages/ProductDetailPage';
import CheckoutPage from './pages/CheckoutPage';
import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';

/**
 * 제품 상세 페이지 래퍼
 * URL 파라미터에서 productId를 추출하여 Context에서 제품 데이터 조회
 */
function ProductDetailRoute() {
  const { productId } = useParams();
  const { isLoading, getProductById } = useProduct();

  // Context에서 제품 조회
  const product = getProductById(productId);

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!product) {
    return (
      <Box sx={{ textAlign: 'center', py: 8 }}>
        제품을 찾을 수 없습니다.
      </Box>
    );
  }

  const meta = {
    itemNumber: `LM-${product.id.slice(0, 8).toUpperCase()}`,
    leadTime: '4 Weeks',
    shipDate: 'Jan 15, 2025',
  };

  return (
    <ProductDetailPage
      product={product}
      meta={meta}
    />
  );
}

/**
 * 메인 앱 레이아웃 (GNB 포함)
 *
 * 동작 방식:
 * 1. GNB의 Cart 아이콘 클릭 시 /checkout으로 이동
 */
function AppLayout() {
  const navigate = useNavigate();

  /**
   * Cart 클릭 → /checkout으로 이동
   */
  const handleCartClick = useCallback(() => {
    navigate('/checkout');
  }, [navigate]);

  return (
    <AppShell onCartClick={handleCartClick}>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/product/:productId" element={<ProductDetailRoute />} />
        <Route path="*" element={<LandingPage />} />
      </Routes>
    </AppShell>
  );
}

/**
 * 메인 App 컴포넌트
 *
 * Provider 구조:
 * - ProductProvider: 전역 제품 데이터 캐싱 (모든 페이지)
 * - CartProvider: 장바구니 상태 관리
 * - TimelineProvider: 타임라인 슬라이더 상태
 *
 * 라우팅 구조:
 * - /checkout: 독립 레이아웃
 * - /*: Public 페이지
 */
function App() {
  return (
    <ProductProvider>
      <CartProvider>
        <TimelineProvider initialTimeline={0}>
          <BrowserRouter>
            <Routes>
              {/* Checkout - 독립 레이아웃 (GNB 없음) */}
              <Route path="/checkout" element={<CheckoutPage />} />

              {/* Main - AppShell 레이아웃 (GNB 포함) */}
              <Route path="/*" element={<AppLayout />} />
            </Routes>
          </BrowserRouter>
        </TimelineProvider>
      </CartProvider>
    </ProductProvider>
  );
}

export default App;
