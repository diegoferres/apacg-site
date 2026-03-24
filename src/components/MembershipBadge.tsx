import { Link, useLocation } from 'react-router-dom';
import { useStore } from '@/stores/store';
import { CheckCircle, AlertCircle, LogIn } from 'lucide-react';

interface MembershipBadgeProps {
  isMember: boolean;
  compact?: boolean;
}

const MembershipBadge = ({ isMember, compact = false }: MembershipBadgeProps) => {
  const { user, isLoggedIn } = useStore();
  const location = useLocation();
  const returnTo = encodeURIComponent(location.pathname + location.search);

  if (isMember) {
    return (
      <div className={`flex items-center gap-2 rounded-md border border-green-200 bg-green-50 text-green-700 ${compact ? 'px-2.5 py-1.5 text-xs' : 'px-3 py-2 text-sm'}`}>
        <CheckCircle className={compact ? 'h-3.5 w-3.5' : 'h-4 w-4'} />
        <span className="font-medium">Precio de socio aplicado</span>
      </div>
    );
  }

  if (!isLoggedIn) {
    return (
      <div className={`flex items-center gap-2 rounded-md border border-orange-200 bg-orange-50 text-orange-700 ${compact ? 'px-2.5 py-1.5 text-xs' : 'px-3 py-2 text-sm'}`}>
        <LogIn className={compact ? 'h-3.5 w-3.5' : 'h-4 w-4'} />
        <span>
          <Link to={`/login?returnTo=${returnTo}`} className="underline font-medium hover:opacity-80">
            Iniciá sesión
          </Link>{' '}para acceder a precios de socio
        </span>
      </div>
    );
  }

  if (user?.member) {
    return (
      <div className={`flex items-center gap-2 rounded-md border border-orange-200 bg-orange-50 text-orange-700 ${compact ? 'px-2.5 py-1.5 text-xs' : 'px-3 py-2 text-sm'}`}>
        <AlertCircle className={compact ? 'h-3.5 w-3.5' : 'h-4 w-4'} />
        <span>
          <Link to="/perfil" className="underline font-medium hover:opacity-80">
            Ponete al día
          </Link>{' '}para acceder a precios de socio
        </span>
      </div>
    );
  }

  // Logueado pero sin membresía (admin u otro rol)
  return (
    <div className={`flex items-center gap-2 rounded-md border border-gray-200 bg-gray-50 text-gray-500 ${compact ? 'px-2.5 py-1.5 text-xs' : 'px-3 py-2 text-sm'}`}>
      <span>Precio regular aplicado</span>
    </div>
  );
};

export default MembershipBadge;
