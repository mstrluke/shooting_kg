import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Target } from 'lucide-react';
import { login } from '@/lib/api';
import { useAuthStore } from '@/store/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const setAuth = useAuthStore((s) => s.setAuth);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setError(''); setLoading(true);
    try { const d = await login(email, password); setAuth(d.token, d.user); navigate('/admin'); }
    catch { setError('Неверный email или пароль'); }
    finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center mb-6">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground mb-3">
            <Target className="size-5" />
          </div>
          <h1 className="text-lg font-semibold">Вход в админ-панель</h1>
          <p className="text-sm text-muted-foreground">Shooting Sport Federation</p>
        </div>
        <Card>
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && <div className="bg-destructive/10 border border-destructive/20 text-destructive text-sm rounded-md p-2.5">{error}</div>}
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Email</label>
                <Input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="admin@shooting.kg" required />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Пароль</label>
                <Input type="password" value={password} onChange={e => setPassword(e.target.value)} required />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Входим...' : 'Войти'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
