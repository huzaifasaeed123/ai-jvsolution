import Link from 'next/link';
import { getTranslator } from '@/i18n/server';

/**
 * 404. Reached both by unknown URLs and by notFound() — which several detail
 * pages now call when a record is missing, private, or the API is unreachable.
 * Those three are deliberately indistinguishable to a visitor: telling someone
 * a confidential listing exists but is not theirs is itself a disclosure.
 */
export default async function NotFound() {
  const t = await getTranslator();

  return (
    <div className="container-page flex min-h-[60vh] flex-col items-center justify-center py-16 text-center">
      <p className="eyebrow">404</p>
      <h1 className="display mt-3 text-[2rem] leading-tight sm:text-[2.5rem]">
        {t('error.notFoundTitle')}
      </h1>
      <p className="mt-4 max-w-md text-muted">{t('error.notFoundBody')}</p>

      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link href="/opportunities" className="btn btn-primary px-5 py-2.5">
          {t('common.browseMarket')}
        </Link>
        <Link href="/" className="btn btn-outline px-5 py-2.5">
          {t('common.backToHome')}
        </Link>
      </div>
    </div>
  );
}
