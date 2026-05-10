// import type { Core } from '@strapi/strapi';

export default {
  /**
   * An asynchronous register function that runs before
   * your application is initialized.
   *
   * This gives you an opportunity to extend code.
   */
  register(/* { strapi }: { strapi: Core.Strapi } */) {},

  /**
   * An asynchronous bootstrap function that runs before
   * your application gets started.
   *
   * This gives you an opportunity to set up your data model,
   * run jobs, or perform some special logic.
   */
  async bootstrap({ strapi }: { strapi: any }) {
    strapi.log.info('🌱 Validating dynamic seed data...');
    
    const slugify = (text: string) => {
      return text
        .toString()
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '') // Remove accents
        .replace(/[^a-z0-9 -]/g, '')    // Remove invalid chars
        .replace(/\s+/g, '-')           // Replace spaces with -
        .replace(/-+/g, '-');           // Remove duplicate -
    };

    try {
      // 1. Seed Categories
      const categoryCount = await strapi.documents('api::category.category').count();
      if (categoryCount === 0) {
        strapi.log.info('Injecting initial categories...');
        const catNames = ['Cocinas', 'Baños', 'Reformas Integrales', 'Interiorismo', 'Espacios Comerciales'];
        
        for (const name of catNames) {
          await strapi.documents('api::category.category').create({
            data: { name, slug: slugify(name) },
            status: 'published',
          });
        }
      }

      // 2. Fetch documents
      const categories = await strapi.documents('api::category.category').findMany({ status: 'published' });
      const catMap = categories.reduce((acc: any, cat: any) => ({ ...acc, [cat.name]: cat.documentId }), {});

      // 3. Seed Projects
      const projectCount = await strapi.documents('api::project.project').count();
      if (projectCount === 0 && categories.length > 0) {
        strapi.log.info('Injecting sample portfolio projects...');
        const sampleProjects = [
          {
            title: 'Cocina Minimalista en Madrid',
            description: 'Una transformación total enfocada en la luminosidad y el espacio abierto.',
            budget: 35000,
            location: 'Madrid Centro',
            timeline: '4 Semanas',
            categoryName: 'Cocinas'
          },
          {
            title: 'Reforma Integral Loft Industrial',
            description: 'Conversión de un antiguo almacén en una vivienda vanguardista en Barcelona.',
            budget: 85000,
            location: 'Barcelona',
            timeline: '12 Semanas',
            categoryName: 'Reformas Integrales'
          },
          {
            title: 'Baño Zen Moderno',
            description: 'Diseño exclusivo que combina materiales naturales y piedra gris mate.',
            budget: 12000,
            location: 'Valencia',
            timeline: '3 Semanas',
            categoryName: 'Baños'
          },
          {
            title: 'Oficinas Open Space Tech',
            description: 'Diseño corporativo contemporáneo con espacios colaborativos e iluminación dinámica.',
            budget: 95000,
            location: 'Madrid',
            timeline: '8 Semanas',
            categoryName: 'Espacios Comerciales'
          },
          {
            title: 'Apartamento Concepto Abierto',
            description: 'Reforma completa de piso de 70m2 ganando amplitud e iluminación natural.',
            budget: 45000,
            location: 'Sevilla',
            timeline: '6 Semanas',
            categoryName: 'Reformas Integrales'
          },
          {
            title: 'Showroom Moda Centro',
            description: 'Local comercial boutique premium con acabados de alta gama.',
            budget: 55000,
            location: 'Bilbao',
            timeline: '5 Semanas',
            categoryName: 'Espacios Comerciales'
          },
          {
            title: 'Remodelación Cocina Americana',
            description: 'Instalación de isla central con encimera de cuarzo y mobiliario lacado.',
            budget: 18000,
            location: 'Málaga',
            timeline: '3 Semanas',
            categoryName: 'Cocinas'
          },
          {
            title: 'Dormitorio Principal Suite',
            description: 'Trabajo de interiorismo creando un oasis de descanso con vestidor.',
            budget: 22000,
            location: 'Barcelona',
            timeline: '4 Semanas',
            categoryName: 'Interiorismo'
          }
        ];

        for (const proj of sampleProjects) {
          const { categoryName, ...data } = proj;
          await strapi.documents('api::project.project').create({
            data: { ...data, category: catMap[categoryName] || categories[0].documentId },
            status: 'published'
          });
        }
      }
      
      strapi.log.info('✨ Seed process finished successfully!');
    } catch (err: any) {
      strapi.log.error('❌ Seed failed: ' + err.message);
    }
  },
};
