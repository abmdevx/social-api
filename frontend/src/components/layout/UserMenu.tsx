import { LogOut, Settings, UserRound } from "lucide-react";
import { Avatar } from "../ui/Avatar";
import { Dropdown, DropdownItem } from "../ui/Dropdown";
import { useAuth } from "../../context/useAuth";
import { useNavigate } from "react-router-dom";

export function UserMenu() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const handleLogout = async () => { await logout(); navigate("/login", { replace: true }); };
  return <Dropdown label={<><Avatar name={user?.fullName || "User"} src={user?.avatar?.url} size="sm" /><span className="hidden text-sm font-medium text-slate-200 lg:inline">{user?.fullName || "Account"}</span></>}>
    <DropdownItem onClick={() => navigate("/profile")}><UserRound size={16} className="mr-2" />My profile</DropdownItem>
    <DropdownItem onClick={() => navigate("/settings")}><Settings size={16} className="mr-2" />Settings</DropdownItem>
    <DropdownItem onClick={() => void handleLogout()}><LogOut size={16} className="mr-2" />Sign out</DropdownItem>
  </Dropdown>;
}
