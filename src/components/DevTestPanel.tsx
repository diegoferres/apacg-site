import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useStore } from '@/stores/store';
import { forceUserWithoutStudents, restoreOriginalUser } from '@/utils/testUtils';

const DevTestPanel = () => {
  const { user, isLoggedIn } = useStore();
  const [isVisible, setIsVisible] = useState(false);

  if (!isLoggedIn || !user) {
    return null;
  }

  const hasStudents = user.member?.students && user.member.students.length > 0;
  const studentCount = user.member?.students?.length || 0;

  if (!isVisible) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <Button 
          onClick={() => setIsVisible(true)}
          variant="outline"
          size="sm"
          className="bg-yellow-100 border-yellow-300 text-yellow-800 hover:bg-yellow-200"
        >
          🧪 Dev Test
        </Button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 w-80">
      <Card className="border-yellow-300 bg-yellow-50">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium text-yellow-800">
              🧪 Panel de Testing
            </CardTitle>
            <Button 
              onClick={() => setIsVisible(false)}
              variant="ghost" 
              size="sm"
              className="h-6 w-6 p-0 text-yellow-600"
            >
              ×
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="text-xs">
            <div className="flex items-center gap-2 mb-2">
              <strong>Usuario:</strong> {user.name}
              <Badge variant={hasStudents ? "default" : "destructive"}>
                {hasStudents ? `${studentCount} estudiantes` : "Sin estudiantes"}
              </Badge>
            </div>
            
            {user.member?.students && (
              <div className="text-xs text-gray-600 mb-3">
                Estudiantes: {user.member.students.map(s => s.full_name).join(', ')}
              </div>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <Button
              onClick={forceUserWithoutStudents}
              variant="outline"
              size="sm"
              className="text-xs"
              disabled={!hasStudents}
            >
              Simular sin estudiantes
            </Button>
            
            <Button
              onClick={restoreOriginalUser}
              variant="outline" 
              size="sm"
              className="text-xs"
              disabled={hasStudents}
            >
              Restaurar datos originales
            </Button>
          </div>

          <div className="text-xs text-gray-500 pt-2 border-t">
            Usa estos botones para probar el comportamiento del splash screen
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DevTestPanel;