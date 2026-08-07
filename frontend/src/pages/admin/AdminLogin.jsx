import { ShieldCheck } from 'lucide-react'
import RoleLogin from '../../components/RoleLogin'

export default function AdminLogin() {
  return (
    <RoleLogin
      role="administrator"
      roleLabel="Administrator"
      icon={ShieldCheck}
      homePath="/admin"
      otherPortals={[{ to: '/learner/login', label: 'Learner' }]}
    />
  )
}
