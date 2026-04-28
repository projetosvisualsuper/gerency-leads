import { api } from '@/services/api';
import UnifiedClientPage from './UnifiedClientPage';
import { headers } from 'next/headers';

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;

  // Tentar carregar Landing Page primeiro
  const lp = await api.getLandingPageBySlug(slug);
  if (lp) {
    return {
      title: lp.config.titulo || 'Gerency Leads',
      description: lp.config.descricao || 'Página de captura profissional.',
      openGraph: {
        title: lp.config.titulo || 'Gerency Leads',
        description: lp.config.descricao || 'Página de captura profissional.',
        images: [lp.config.logoUrl && lp.config.logoUrl !== 'none' ? lp.config.logoUrl : '/images/sales-bg.png'],
      },
    };
  }

  // Se não for LP, tentar Bio Link
  const bio = await api.getBioLinkBySlug(slug);
  if (bio) {
    const headerList = await headers();
    const host = headerList.get('host');
    const protocol = host?.includes('localhost') ? 'http' : 'https';
    const imageUrl = bio.avatarUrl?.startsWith('data:image') 
      ? `${protocol}://${host}/api/bio-image/${bio.id}`
      : (bio.avatarUrl || '/images/minimalist-bg.png');

    return {
      title: `${bio.profileName} | Bio Link`,
      description: bio.bio || 'Confira meus links e redes sociais.',
      openGraph: {
        title: bio.profileName,
        description: bio.bio || 'Confira meus links e redes sociais.',
        images: [imageUrl],
        type: 'website',
      },
      twitter: {
        card: 'summary_large_image',
        title: bio.profileName,
        description: bio.bio,
        images: [imageUrl],
      }
    };
  }

  return {
    title: 'Página não encontrada | Gerency Leads',
  };
}

export default async function Page({ params }: Props) {
  const { slug } = await params;
  
  // Otimização: Carregar dados iniciais no servidor para evitar loading no cliente
  let initialData = null;
  const lp = await api.getLandingPageBySlug(slug);
  if (lp) {
    initialData = { type: 'lp', content: lp };
  } else {
    const bio = await api.getBioLinkBySlug(slug);
    if (bio) {
      initialData = { type: 'bio', content: bio };
    }
  }

  return <UnifiedClientPage slug={slug} initialData={initialData} />;
}
