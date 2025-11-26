interface FoodCardProps {
  name: string;
  quantity: number;
  unit: string;
}

const FoodCard: React.FC<FoodCardProps> = ({ name, quantity, unit }) => {
  return (
    <div className="inline-flex items-center gap-2 bg-primary-50 text-primary-800 px-4 py-2 rounded-full border-2 border-primary-200 font-medium">
      <span className="text-lg">🍽</span>
      <span>
        {name} × {quantity} {unit}
      </span>
    </div>
  );
};

export default FoodCard;
