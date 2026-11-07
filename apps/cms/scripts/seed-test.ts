import { createStrapi } from '@strapi/strapi';

/**
 * Idempotent test seed for the CMS.
 *
 * Boots Strapi, resets the Public role permissions to empty (no content types
 * exist yet in the walking skeleton), and exits. This script grows with each
 * story: new content types add their public permissions here.
 */
async function main(): Promise<void> {
  const strapi = createStrapi();
  await strapi.load();

  const roleModel = 'plugin::users-permissions.role';
  const publicRole = await strapi.db.query(roleModel).findOne({
    where: { type: 'public' },
  });

  if (publicRole === null || publicRole === undefined) {
    console.log('Public role not found — Strapi will create it on next bootstrap.');
  } else {
    await strapi.db.query(roleModel).update({
      where: { id: publicRole.id },
      data: { permissions: {} },
    });
    console.log('Public role permissions reset to empty.');
  }

  await strapi.destroy();
  process.exit(0);
}

main().catch((error) => {
  console.error('Seed failed:', error);
  process.exit(1);
});
