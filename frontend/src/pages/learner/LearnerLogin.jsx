import { GraduationCap } from 'lucide-react'
import RoleLogin from '../../components/RoleLogin'

export default function LearnerLogin() {
  return (
    <RoleLogin
      role="learner"
      roleLabel="Learner"
      icon={GraduationCap}
      homePath="/learner"
      registerPath="/register"
      otherPortals={[{ to: '/coach/login', label: 'Debate Coach' }]}
    />
  )
}
