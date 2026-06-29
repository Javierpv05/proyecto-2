import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ProductCard, type Product } from '../../components/ProductCard';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import { Modal } from '../../components/Modal';
import { EmptyState } from '../../components/EmptyState';
import { catalogoClient } from '../../api/client';
import { rappiService } from '../../api/rappi.service';
import '../client/Menu.css';

/**
 * Pagina solo para pruebas/demo: simula el lado de Rappi creando un pedido
 * a traves del API Gateway de OCI (no llama a AWS directamente). El pedido
 * resultante se rastrea con el mismo /pedido/:id que usa un cliente real.
 */
export const RappiDemo: React.FC = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [cart, setCart] = useState<{ product: Product, quantity: number }[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const fetchProducts = async () => {
      try {
        const data = await catalogoClient.get<{ items: any[] }>('/productos', { requiresAuth: false });
        if (isMounted) {
          const items = Array.isArray(data?.items) ? data.items : [];
          setProducts(items.map(p => ({ ...p, id: p.producto_id })));
        }
      } catch (err: any) {
        if (isMounted) setError('No se pudo cargar el catálogo.');
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
        return { ...item, quantity: Math.max(0, item.quantity + delta) };
      }
      return item;
    }).filter(item => item.quantity > 0));
  };

  const total = cart.reduce((sum, item) => sum + (item.product.precio * item.quantity), 0);

  const handleConfirmOrder = async () => {
    setIsSubmitting(true);
    try {
      const response = await rappiService.crearPedido({
        tenant_id: import.meta.env.VITE_TENANT_ID,
        cliente_nombre: clientName,
        cliente_telefono: clientPhone,
        items: cart.map(item => ({
          producto_id: item.product.id,
          nombre: item.product.nombre,
          cantidad: item.quantity,
          precio: item.product.precio
        })),
        total
      });
      setIsModalOpen(false);
      const newOrderId = response.pedido_id;
      navigate(newOrderId ? `/pedido/${newOrderId}` : '/pedido');
    } catch (err) {
      console.error(err);
      alert('Ocurrió un error al crear el pedido vía OCI/Rappi. Revisa que VITE_OCI_RAPPI_URL esté configurada.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="menu-page">
      <div className="menu-content">
        <div className="menu-header" style={{ background: 'var(--color-text)', color: 'white', padding: '12px 16px', borderRadius: 'var(--radius-md)', marginBottom: '16px' }}>
          <h1 className="menu-title" style={{ color: 'white' }}>🛵 Simulador Rappi</h1>
          <p className="menu-subtitle" style={{ color: '#ccc' }}>
            Este pedido se crea vía OCI (no AWS directo) — así se simula la llegada real de un pedido externo.
          </p>
        </div>

        {isLoading ? (
          <div>Cargando catálogo...</div>
        ) : error ? (
          <EmptyState title="Ups" subtitle={error} icon="🔌" />
        ) : (
          <div className="products-grid">
            {products.map(product => (
              <ProductCard key={product.id} product={product} onAdd={handleAddToCart} />
            ))}
          </div>
        )}
      </div>

      <div className="cart-sidebar">
        <h2 className="cart-title">Pedido Rappi</h2>
        {cart.length === 0 ? (
          <div className="cart-empty">Agrega productos al pedido</div>
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
              <Button variant="primary" size="lg" className="cart-checkout-btn" onClick={() => setIsModalOpen(true)}>
                Simular pedido Rappi
              </Button>
            </div>
          </>
        )}
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Datos del pedido (simulado)">
        <div className="modal-body-content">
          <Input placeholder="Nombre del cliente" value={clientName} onChange={e => setClientName(e.target.value)} />
          <Input placeholder="Teléfono" value={clientPhone} onChange={e => setClientPhone(e.target.value)} style={{ marginTop: '12px' }} />
          <div className="modal-footer">
            <Button variant="ghost" onClick={() => setIsModalOpen(false)}>Cancelar</Button>
            <Button
              variant="primary"
              onClick={handleConfirmOrder}
              isLoading={isSubmitting}
              disabled={!clientName.trim() || !clientPhone.trim()}
            >
              Enviar a OCI
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
