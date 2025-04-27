import { useRouter } from "next/navigation"
import { DropdownMenuItem } from "../ui/dropdown-menu"

const DashboardButton = ({}) => {
  const router = useRouter()
  const handleRedirect = () => {
    router.push('/dashboard')
  }
  return <a href="/dashboard"><DropdownMenuItem className='cursor-pointer'>Dashboard</DropdownMenuItem></a>
}

export default DashboardButton