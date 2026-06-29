import React from 'react';
import { Button } from './Button';
import './ProductCard.css';

export interface Product {
  id: string;
  nombre: string;
  descripcion?: string;
  precio: number;
  disponible: boolean;
  imagen_url?: string;
  categoria?: string;
}

interface ProductCardProps {
  product: Product;
  onAdd: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onAdd }) => {
  return (
    <div className={`product-card ${!product.disponible ? 'unavailable' : ''}`}>
      <div className="product-image">
        {product.imagen_url ? (
          <img src={product.imagen_url} alt={product.nombre} />
        ) : (
          <div className="product-image-placeholder"></div>
        )}
      </div>
      <div className="product-info">
        <h3 className="product-name">{product.nombre}</h3>
        {product.descripcion && (
          <p className="product-desc">{product.descripcion}</p>
        )}
        <div className="product-price">
          S/. {product.precio.toFixed(2)}
        </div>
        <Button
          variant="primary"
          size="sm"
          className="product-add-btn"
          disabled={!product.disponible}
          onClick={() => onAdd(product)}
        >
          {product.disponible ? '+ Agregar' : 'No disponible'}
        </Button>
      </div>
    </div>
  );
};
