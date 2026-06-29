import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ProductCard, type Product } from '../../components/ProductCard';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import { Modal } from '../../components/Modal';
import { EmptyState } from '../../components/EmptyState';
import { apiClient } from '../../api/client';
import './Menu.css';

export const Menu: React.FC = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [cart, setCart] = useState<{product: Product, quantity: number}[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [clientName, setClientName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const fetchProducts = async () => {
      try {
        const data = await apiClient.get<Product[]>('/productos', { requiresAuth: false });
        if (isMounted) {
          setProducts(Array.isArray(data) ? data : []);
        }
      } catch (err: any) {
        if (isMounted) {
          setError('No se pudo cargar el menú. Por favor, intenta de nuevo más tarde.');
          console.error(err);
        }
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    fetchProducts();
    return () => { isMounted = false; };
  }, []);

  const handleAddToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(item => item.product.id === product.id);
      if (existing) {
        return prev.map(item => item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, { product, quantity: 1 }];
    });
  };

  const updateQuantity = (productId: string, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.product.id === productId) {
        const newQuantity = Math.max(0, item.quantity + delta);
        return { ...item, quantity: newQuantity };
      }
      return item;
    }).filter(item => item.quantity > 0));
  };

  const total = cart.reduce((sum, item) => sum + (item.product.precio * item.quantity), 0);

  const handleConfirmOrder = async () => {
    setIsSubmitting(true);
    try {
      const payload = {
        tenant_id: "madam-tusan",
        cliente_nombre: clientName,
        items: cart.map(item => ({
          producto_id: item.product.id,
          nombre: item.product.nombre,
          cantidad: item.quantity,
          precio: item.product.precio
        })),
        total: total
      };

      const response = await apiClient.post<any>('/pedidos', payload, { requiresAuth: false });
      setIsModalOpen(false);
      
      // Intentar extraer el ID del pedido desde la respuesta
      const newOrderId = response.pedido_id || response.id;
      if (newOrderId) {
        navigate(`/pedido/${newOrderId}`);
      } else {
        // En caso de que la respuesta no contenga un ID claro, redirigimos a /pedido para que el usuario pueda buscarlo
        navigate('/pedido');
      }
    } catch (err) {
      console.error(err);
      alert('Ocurrió un error al procesar tu pedido. Por favor, intenta de nuevo.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="menu-page">
      <div className="menu-content">
        <div className="menu-header">
          <h1 className="menu-title">Nuestro Menú</h1>
          <p className="menu-subtitle">Los mejores platos, listos para ti.</p>
        </div>

        {isLoading ? (
          <div className="products-grid">
            {[1,2,3,4,5,6].map(i => (
              <div key={i} className="product-skeleton">
                <div className="skeleton-image"></div>
                <div className="skeleton-text skeleton-title"></div>
                <div className="skeleton-text skeleton-desc"></div>
                <div className="skeleton-text skeleton-price"></div>
                <div className="skeleton-button"></div>
              </div>
            ))}
          </div>
        ) : error ? (
          <EmptyState title="Ups, algo salió mal" subtitle={error} icon="🔌" />
        ) : products.length === 0 ? (
          <EmptyState title="El menú estará disponible pronto" icon="🍽" />
        ) : (
          <div className="products-grid">
            {products.map(product => (
              <ProductCard key={product.id} product={product} onAdd={handleAddToCart} />
            ))}
          </div>
        )}
      </div>

      {/* Sidebar Carrito (Desktop) */}
      <div className="cart-sidebar">
        <h2 className="cart-title">Tu pedido</h2>
        
        {cart.length === 0 ? (
          <div className="cart-empty">Agrega productos al carrito</div>
        ) : (
          <>
            <div className="cart-items">
              {cart.map(item => (
                <div key={item.product.id} className="cart-item">
                  <div className="cart-item-info">
                    <div className="cart-item-name">{item.product.nombre}</div>
                    <div className="cart-item-price">S/. {(item.product.precio * item.quantity).toFixed(2)}</div>
                  </div>
                  <div className="cart-item-actions">
                    <button onClick={() => updateQuantity(item.product.id, -1)}>-</button>
                    <span>{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.product.id, 1)}>+</button>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="cart-footer">
              <div className="cart-total-label">Total</div>
              <div className="cart-total-value">S/. {total.toFixed(2)}</div>
              <Button 
                variant="primary" 
                size="lg" 
                className="cart-checkout-btn"
                onClick={() => setIsModalOpen(true)}
              >
                Confirmar pedido
              </Button>
            </div>
          </>
        )}
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="¿A nombre de quién es el pedido?">
        <div className="modal-body-content">
          <Input 
            placeholder="Tu nombre" 
            value={clientName} 
            onChange={e => setClientName(e.target.value)}
          />
          <div className="modal-footer">
            <Button variant="ghost" onClick={() => setIsModalOpen(false)}>Cancelar</Button>
            <Button 
              variant="primary" 
              onClick={handleConfirmOrder} 
              isLoading={isSubmitting}
              disabled={!clientName.trim()}
            >
              Confirmar pedido
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
