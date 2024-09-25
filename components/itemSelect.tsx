import { Select, SelectContent, SelectItem, SelectTrigger } from "./ui/select";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Label } from "./ui/label";
import { FormControl } from "./ui/form";
// import { Item } from "../app/pos/columns";
import { useState } from "react";

interface Item {
  id: string;
  itemName: string;
  price: number;
  stock: number;
  category: string;
  quantity: number;
}

interface ItemSelectProps {
  items: Item[];
  onItemChange: (itemId: number, quantity: number) => void;
  onRemove: () => void;
}

export const ItemSelect: React.FC<ItemSelectProps> = ({
  items,
  onItemChange,
  onRemove,
}) => {
  const [selectedItemId, setSelectedItemId] = useState<number | null>(null);
  const [quantity, setQuantity] = useState<number>(1);

  const handleItemChange = (itemId: string) => {
    const id = parseInt(itemId);
    setSelectedItemId(id);
    onItemChange(id, quantity);
  };

  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newQuantity = parseInt(e.target.value);
    setQuantity(newQuantity);
    if (selectedItemId !== null) {
      onItemChange(selectedItemId, newQuantity);
    }
  };

  return (
    <div className="grid grid-cols-2 gap-4 mb-4">
      <div>
        <Label htmlFor="item">Item</Label>
        <FormControl>
          <Select onValueChange={handleItemChange}>
            <SelectTrigger>Choose an item</SelectTrigger>
            <SelectContent>
              {items.map((item) => (
                <SelectItem
                  key={item.id}
                  value={item.id.toString()}
                  className=""
                >
                  A{item.itemName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FormControl>
      </div>

      <div>
        <Label htmlFor="quantity">Quantity</Label>
        <FormControl>
          <Input
            type="number"
            name="quantity"
            id="quantity"
            value={quantity}
            min={1}
            onChange={handleQuantityChange}
            required
          />
        </FormControl>
      </div>

      <Button variant="destructive" onClick={onRemove}>
        Remove
      </Button>
    </div>
  );
};
