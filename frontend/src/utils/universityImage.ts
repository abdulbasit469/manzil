/** Fallback hero image when university has no `image` in DB */

export interface UniversityLike {
  name: string;
  image?: string;
  logo?: string;
}

export function getUniversityImage(university: UniversityLike): string {
  if (university.image) return university.image;

  const name = university.name.toLowerCase();

  if (name.includes('nust') || name.includes('national university of sciences')) {
    return 'https://images.unsplash.com/photo-1562774053-701939374585?w=800&h=500&fit=crop';
  }
  if (name.includes('lums') || name.includes('lahore university of management')) {
    return 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=800&h=500&fit=crop';
  }
  if (name.includes('fast') || name.includes('computer & emerging sciences')) {
    return 'https://images.unsplash.com/photo-1498243691581-b145c3f54a5a?w=800&h=500&fit=crop';
  }
  if (name.includes('uet') || name.includes('university of engineering & technology')) {
    return 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=800&h=500&fit=crop';
  }
  if (name.includes('pieas') || name.includes('pakistan institute of engineering')) {
    return 'https://images.unsplash.com/photo-1607237138185-eedd9c632b0b?w=800&h=500&fit=crop';
  }
  if (name.includes('comsats')) {
    return 'https://images.unsplash.com/photo-1519452635265-7b1fbfd1e4e0?w=800&h=500&fit=crop';
  }
  if (name.includes('aiou') || name.includes('allama iqbal open')) {
    return 'https://images.unsplash.com/photo-1571260899304-425eee4c7efc?w=800&h=500&fit=crop';
  }
  if (name.includes('bahria')) {
    return 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800&h=500&fit=crop';
  }
  if (name.includes('iba') || name.includes('institute of business administration')) {
    return 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=800&h=500&fit=crop';
  }
  if (name.includes('giki') || name.includes('ghulam ishaq khan')) {
    return 'https://images.unsplash.com/photo-1509062522246-3755977927d7?w=800&h=500&fit=crop';
  }
  if (name.includes('aga khan')) {
    return 'https://images.unsplash.com/photo-1551601651-2a8555f1a136?w=800&h=500&fit=crop';
  }
  if (name.includes('air university')) {
    return 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800&h=500&fit=crop';
  }
  if (name.includes('bzu') || name.includes('bahauddin zakariya')) {
    return 'https://images.unsplash.com/photo-1571260899304-425eee4c7efc?w=800&h=500&fit=crop';
  }

  return 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=800&h=500&fit=crop';
}
