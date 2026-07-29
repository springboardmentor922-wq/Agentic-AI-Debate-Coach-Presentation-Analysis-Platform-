import { BookOpen } from 'lucide-react'
import RoleLogin from '../../components/RoleLogin'

export default function EducatorLogin() {
  return (
    <RoleLogin
      role="educator"
      roleLabel="Educator"
      icon={BookOpen}
      homePath="/educator"
      otherPortals={[{ to: '/admin/login', label: 'Administrator' }]}
    />
  )
}
