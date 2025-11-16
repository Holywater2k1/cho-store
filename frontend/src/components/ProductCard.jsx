// src/components/ProductCard.jsx
export default function ProductCard({ product, onAddToCart, bestSeller = false }) {
  if (!product) return null;

  const { name, description, price, image_url, mood, size, stock } = product;
  const isOutOfStock = typeof stock === "number" && stock === 0;

  const handleAdd = () => {
    if (isOutOfStock) return;
    if (onAddToCart) onAddToCart(product);
  };

  return (
    <article
      className={`product-card relative transition-transform duration-200 ${
        isOutOfStock
          ? "opacity-60"
          : "hover:-translate-y-1 hover:shadow-[0_18px_40px_rgba(0,0,0,0.08)]"
      }`}
    >
      {/* Badges */}
      {bestSeller && (
        <span className="badge-soft absolute top-3 left-3">
          Best seller
        </span>
      )}

      {isOutOfStock && (
        <span className="absolute top-3 right-3 rounded-full bg-red-600 text-white text-[0.7rem] px-2 py-1 shadow-sm">
          Out of stock
        </span>
      )}

      {/* Image */}
      <div className="h-44 bg-choForest/5 flex items-center justify-center overflow-hidden">
        {image_url ? (
          <img
            src={image_url}
            alt={name}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex flex-col items-center justify-center text-[0.7rem] text-choForest/60 gap-1">
            <div className="h-10 w-10 rounded-full border border-dashed border-choForest/30" />
            <p>No image yet</p>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex flex-col flex-1 p-4">
        <p className="text-[0.65rem] uppercase tracking-[0.18em] text-choForest/50 mb-1">
          {mood || "Everyday mood"} {size ? `• ${size}` : ""}
        </p>

        <h3 className="font-heading text-base mb-1">{name}</h3>

        {description && (
          <p className="text-sm text-gray-700 leading-relaxed mb-3">
            {description}
          </p>
        )}

        {typeof stock === "number" && (
          <p className="text-[0.7rem] text-gray-500 mb-3">
            {isOutOfStock ? "Not available right now" : `In stock: ${stock}`}
          </p>
        )}

        <div className="mt-auto flex items-center justify-between pt-1">
          <span className="font-semibold text-sm">{price} THB</span>
          <button
            type="button"
            onClick={handleAdd}
            disabled={isOutOfStock}
            className={`btn-outline text-xs ${
              isOutOfStock ? "opacity-60 cursor-not-allowed" : ""
            }`}
          >
            {isOutOfStock ? "Unavailable" : "Add to cart"}
          </button>
        </div>
      </div>
    </article>
  );
}
