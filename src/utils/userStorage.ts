import { User } from '../types';
import { ADMIN_CREDENTIALS } from '../data/initialData';

const ADMIN_PROFILE_KEY = 'badgommys_admin_profile';
const SAVED_AVATARS_KEY = 'badgommys_saved_avatars';

export const DEFAULT_ADMIN_AVATAR = 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80';
export const DEFAULT_CUSTOMER_AVATAR = 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80';

export interface PresetAvatar {
  id: string;
  name: string;
  category: string;
  url: string;
}

export const BADGOMMYS_PRESET_AVATARS: PresetAvatar[] = [
  {
    id: 'avatar-mango-fuego',
    name: 'Mango Enchilado',
    category: 'Gomita Artesanal',
    url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
  },
  {
    id: 'avatar-chamoy-lover',
    name: 'Chamoy Master',
    category: 'Gomita Artesanal',
    url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80',
  },
  {
    id: 'avatar-pandita-neon',
    name: 'Pandita Picosito',
    category: 'Gomita Artesanal',
    url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&auto=format&fit=crop&q=80',
  },
  {
    id: 'avatar-gommy-king',
    name: 'Rey BadGommys',
    category: 'Gomita Artesanal',
    url: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&auto=format&fit=crop&q=80',
  },
  {
    id: 'avatar-sandia-tajin',
    name: 'Sandía con Tajín',
    category: 'Gomita Artesanal',
    url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=200&auto=format&fit=crop&q=80',
  },
  {
    id: 'avatar-dulce-diablo',
    name: 'Diablito Enchilado',
    category: 'Gomita Artesanal',
    url: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=200&auto=format&fit=crop&q=80',
  },
  {
    id: 'avatar-cereza-brava',
    name: 'Cereza Ácida',
    category: 'Gomita Artesanal',
    url: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=200&auto=format&fit=crop&q=80',
  },
  {
    id: 'avatar-chef-artesano',
    name: 'Chef Gomitas',
    category: 'Gomita Artesanal',
    url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80',
  },
];

/**
 * Universal safe image compression helper for profiles & avatars
 * Compresses images down to ~256x256 WebP/JPEG, capped under 30KB so localStorage never crashes.
 */
export function compressAvatarImage(file: File, maxDim = 280, quality = 0.8): Promise<string> {
  return new Promise((resolve, reject) => {
    // Validate file type
    if (!file.type.startsWith('image/')) {
      reject(new Error('El archivo seleccionado no es una imagen válida.'));
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxDim) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          }
        } else {
          if (height > maxDim) {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = Math.max(1, width);
        canvas.height = Math.max(1, height);
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(event.target?.result as string);
          return;
        }

        // Draw image on canvas with nice smoothing
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, width, height);

        try {
          // Prefer WebP or JPEG for compact size
          const compressed = canvas.toDataURL('image/jpeg', quality);
          resolve(compressed);
        } catch {
          resolve(event.target?.result as string);
        }
      };

      img.onerror = () => {
        resolve(event.target?.result as string);
      };

      img.src = event.target?.result as string;
    };

    reader.onerror = (err) => reject(err);
    reader.readAsDataURL(file);
  });
}

/**
 * Gets a map of saved avatars keyed by normalized email
 */
export function getSavedAvatarsMap(): Record<string, string> {
  try {
    const data = localStorage.getItem(SAVED_AVATARS_KEY);
    return data ? JSON.parse(data) : {};
  } catch {
    return {};
  }
}

/**
 * Persists an avatar for a specific user email
 */
export function saveUserAvatar(email: string, avatar: string): void {
  try {
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail) return;
    const map = getSavedAvatarsMap();
    map[cleanEmail] = avatar;
    localStorage.setItem(SAVED_AVATARS_KEY, JSON.stringify(map));
  } catch (e) {
    console.warn('Could not save avatar to localStorage map:', e);
  }
}

/**
 * Retrieves a saved avatar by email
 */
export function getSavedUserAvatar(email: string): string | null {
  try {
    const cleanEmail = email.trim().toLowerCase();
    const map = getSavedAvatarsMap();
    return map[cleanEmail] || null;
  } catch {
    return null;
  }
}

/**
 * Retrieves the persistent admin profile or returns default
 */
export function getSavedAdminProfile(): User {
  try {
    const saved = localStorage.getItem(ADMIN_PROFILE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      return {
        id: 'admin-master',
        name: parsed.name || 'Administrador BadGommys',
        email: ADMIN_CREDENTIALS.email,
        role: 'admin',
        registeredAt: '2026-01-01',
        avatar: parsed.avatar || getSavedUserAvatar(ADMIN_CREDENTIALS.email) || DEFAULT_ADMIN_AVATAR,
        phone: parsed.phone || '768 104 6796',
        address: parsed.address || 'Naranjos, Amatlan, Veracruz',
      };
    }
  } catch {
    // fallback
  }

  const avatar = getSavedUserAvatar(ADMIN_CREDENTIALS.email) || DEFAULT_ADMIN_AVATAR;
  return {
    id: 'admin-master',
    name: 'Administrador BadGommys',
    email: ADMIN_CREDENTIALS.email,
    role: 'admin',
    registeredAt: '2026-01-01',
    avatar,
    phone: '768 104 6796',
    address: 'Naranjos, Amatlan, Veracruz',
  };
}

/**
 * Persists changes to the admin profile (avatar, name, phone, etc.)
 */
export function saveAdminProfile(profile: Partial<User>): void {
  try {
    const current = getSavedAdminProfile();
    const updated: User = {
      ...current,
      ...profile,
      role: 'admin',
      email: ADMIN_CREDENTIALS.email,
    };
    localStorage.setItem(ADMIN_PROFILE_KEY, JSON.stringify(updated));
    if (updated.avatar) {
      saveUserAvatar(ADMIN_CREDENTIALS.email, updated.avatar);
    }
  } catch (e) {
    console.warn('Could not save admin profile to localStorage:', e);
  }
}
