import { useContext } from "react";
import { CartContext } from "@/context/CartContext";

// Custom hook for easy access
export const useCart = () => {
  const context = useContext(CartContext);

  // this safety check prevents the "blank screen" if you forget the Provider
  if (!context) throw new Error("useCart must be used within a CartProvider");

  return context;
};
