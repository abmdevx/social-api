import { Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "../ui/Button";

export function CreateButton() {
  const navigate = useNavigate();
  return <Button variant="primary" size="sm" onClick={() => navigate("/studio/upload")}><Plus size={16} />Create</Button>;
}
