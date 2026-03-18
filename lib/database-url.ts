function shouldUpgradeSslMode(url: URL) {
  const sslMode = url.searchParams.get('sslmode');

  return sslMode === 'prefer' || sslMode === 'require' || sslMode === 'verify-ca';
}

export function normalizeDatabaseUrl(connectionString: string) {
  let url: URL;

  try {
    url = new URL(connectionString);
  } catch {
    return connectionString;
  }

  if (!shouldUpgradeSslMode(url)) {
    return connectionString;
  }

  url.searchParams.set('sslmode', 'verify-full');
  return url.toString();
}
