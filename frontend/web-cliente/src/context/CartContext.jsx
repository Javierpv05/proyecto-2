import { createContext, useContext, useState, useCallback } from 'react'

const CartContext = createContext(null)

export function CartProvider({ children }) {
  const [items, setItems] = useState([])   // [{ producto_id, nombre, precio, cantidad, emoji }]

  const addItem = useCallback((producto) => {
    setItems(prev => {
      const exists = prev.find(i => i.producto_id === producto.producto_id)
      if (exists) {
        return prev.map(i =>
          i.producto_id === producto.producto_id
            ? { ...i, cantidad: i.cantidad + 1 }
            : i
        )
      }
      return [...prev, { ...producto, cantidad: 1 }]
    })
  }, [])

  const updateQty = useCallback((producto_id, delta) => {
    setItems(prev =>
      prev
        .map(i => i.producto_id === producto_id ? { ...i, cantidad: i.cantidad + delta } : i)
        .filter(i => i.cantidad > 0)
    )
  }, [])

  const removeItem = useCallback((producto_id) => {
    setItems(prev => prev.filter(i => i.producto_id !== producto_id))
  }, [])

  const clearCart = useCallback(() => setItems([]), [])

  const total = items.reduce((acc, i) => acc + Number(i.precio) * i.cantidad, 0)
  const count = items.reduce((acc, i) => acc + i.cantidad, 0)

  return (
    <CartContext.Provider value={{ items, addItem, updateQty, removeItem, clearCart, total, count }}>
      {children}
    </CartContext.Provider>
  )
}

export const useCart = () => useContext(CartContext)
