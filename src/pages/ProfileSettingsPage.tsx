import { useEffect, useState } from 'react';
import type { User } from '@supabase/supabase-js';
import { CheckCircle2, Save, UserCircle } from 'lucide-react';
import { Card, CardBody, CardHeader } from '@/components/ui/Card';
import { PageHeader } from '@/components/ui/States';
import { supabase } from '@/lib/supabase';

export function ProfileSettingsPage() {
  const [user, setUser] = useState<User | null>(null);
  const [displayName, setDisplayName] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    void supabase.auth.getUser().then(({ data, error: userError }) => {
      if (!mounted) return;
      if (userError) setError(userError.message);
      const currentUser = data.user ?? null;
      setUser(currentUser);
      setDisplayName(typeof currentUser?.user_metadata?.full_name === 'string' ? currentUser.user_metadata.full_name : '');
      setLoading(false);
    });
    return () => { mounted = false; };
  }, []);

  const save = async () => {
    if (!user) return;
    setSaving(true);
    setMessage(null);
    setError(null);
    const cleanName = displayName.trim();
    const { data, error: updateError } = await supabase.auth.updateUser({
      data: { full_name: cleanName || null },
    });
    setSaving(false);
    if (updateError) {
      setError(updateError.message);
      return;
    }
    if (data.user) setUser(data.user);
    setMessage('تم حفظ اسم العرض بنجاح. سيظهر الاسم الجديد في واجهة النظام.');
  };

  if (loading) return <div dir="rtl" className="py-20 text-center text-sm text-ink-500">جارٍ تحميل بيانات الحساب...</div>;

  return (
    <div dir="rtl" className="space-y-6 animate-fade-in">
      <PageHeader title="الملف الشخصي" subtitle="تحكم في اسم العرض والهوية الظاهرة داخل التطبيق" />

      <Card>
        <CardHeader title="هوية المستخدم" />
        <CardBody>
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center">
              <UserCircle size={28} />
            </div>
            <div>
              <div className="text-sm font-semibold text-ink-800">{user?.email || 'لم يتم تحديد البريد الإلكتروني'}</div>
              <div className="text-xs text-ink-400 mt-1">البريد الإلكتروني يأتي من حساب المصادقة ولا يتم تخزينه كقيمة ثابتة في الواجهة.</div>
            </div>
          </div>

          <label htmlFor="profile-display-name" className="block text-sm font-medium text-ink-700 mb-2">اسم العرض</label>
          <input
            id="profile-display-name"
            value={displayName}
            onChange={event => setDisplayName(event.target.value)}
            maxLength={120}
            placeholder="اكتب الاسم الذي تريد ظهوره في النظام"
            className="input w-full max-w-xl"
            autoComplete="name"
          />
          <p className="mt-2 text-xs text-ink-400">يمكنك تغييره لاحقًا دون تعديل الكود.</p>

          <div className="mt-5 flex flex-wrap items-center gap-3">
            <button type="button" disabled={saving || !user} onClick={() => void save()} className="btn-primary inline-flex items-center gap-2 disabled:opacity-50">
              <Save size={16} />
              {saving ? 'جارٍ الحفظ...' : 'حفظ اسم العرض'}
            </button>
            {message && <span className="inline-flex items-center gap-1.5 text-sm text-success-600"><CheckCircle2 size={16} /> {message}</span>}
            {error && <span role="alert" className="text-sm text-danger-600">{error}</span>}
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
