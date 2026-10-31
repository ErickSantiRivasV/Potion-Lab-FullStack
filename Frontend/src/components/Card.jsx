function Card({ children, className = "", hover = false }) {
  return (
    <div
      className={`
        bg-app-surface
        rounded-card
        shadow-card
        border
        border-app-border
        transition-all
        duration-200
        ease-spring
        ${hover ? "hover:shadow-card-hover hover:-translate-y-1" : ""}
        ${className}
      `}
    >
      {children}
    </div>
  );
}

export default Card;