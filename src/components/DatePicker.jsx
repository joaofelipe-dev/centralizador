import { DayPicker } from "react-day-picker";
import "react-day-picker/style.css";

function DatePicker() {
  const [selected, setSelected] = useState<Date>(null);

  return (
    <DayPicker
      animate
      mode="single"
      selected={selected}
      onSelect={setSelected}
      footer={
        selected ? `Selected: ${selected.toLocaleDateString()}` : "Pick a day."
      }
    />
  );
}