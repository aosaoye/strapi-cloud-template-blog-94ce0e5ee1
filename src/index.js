'use strict';

module.exports = {
  register() {},

  async bootstrap({ strapi }) {
    strapi.log.info('Validating dynamic seed data...');

    const slugify = (text) => {
      return text
        .toString()
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9 -]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-');
    };

    try {
      const categoryCount = await strapi.documents('api::category.category').count();

      if (categoryCount === 0) {
        strapi.log.info('Injecting initial categories...');

        const categoryNames = [
          'Cocinas',
          'Banos',
          'Reformas Integrales',
          'Interiorismo',
          'Espacios Comerciales',
        ];

        for (const name of categoryNames) {
          await strapi.documents('api::category.category').create({
            data: { name, slug: slugify(name) },
            status: 'published',
          });
        }
      }

      const categories = await strapi.documents('api::category.category').findMany({
        status: 'published',
      });
      const categoryMap = categories.reduce((accumulator, category) => {
        accumulator[category.name] = category.documentId;
        return accumulator;
      }, {});

      const projectCount = await strapi.documents('api::project.project').count();

      if (projectCount === 0 && categories.length > 0) {
        strapi.log.info('Injecting sample portfolio projects...');

        const sampleProjects = [
          {
            title: 'Cocina Minimalista en Madrid',
            description: 'Una transformacion total enfocada en la luminosidad y el espacio abierto.',
            budget: 35000,
            location: 'Madrid Centro',
            timeline: '4 Semanas',
            categoryName: 'Cocinas',
          },
          {
            title: 'Reforma Integral Loft Industrial',
            description: 'Conversion de un antiguo almacen en una vivienda vanguardista en Barcelona.',
            budget: 85000,
            location: 'Barcelona',
            timeline: '12 Semanas',
            categoryName: 'Reformas Integrales',
          },
          {
            title: 'Bano Zen Moderno',
            description: 'Diseno exclusivo que combina materiales naturales y piedra gris mate.',
            budget: 12000,
            location: 'Valencia',
            timeline: '3 Semanas',
            categoryName: 'Banos',
          },
          {
            title: 'Oficinas Open Space Tech',
            description: 'Diseno corporativo contemporaneo con espacios colaborativos e iluminacion dinamica.',
            budget: 95000,
            location: 'Madrid',
            timeline: '8 Semanas',
            categoryName: 'Espacios Comerciales',
          },
          {
            title: 'Apartamento Concepto Abierto',
            description: 'Reforma completa de piso de 70m2 ganando amplitud e iluminacion natural.',
            budget: 45000,
            location: 'Sevilla',
            timeline: '6 Semanas',
            categoryName: 'Reformas Integrales',
          },
          {
            title: 'Showroom Moda Centro',
            description: 'Local comercial boutique premium con acabados de alta gama.',
            budget: 55000,
            location: 'Bilbao',
            timeline: '5 Semanas',
            categoryName: 'Espacios Comerciales',
          },
          {
            title: 'Remodelacion Cocina Americana',
            description: 'Instalacion de isla central con encimera de cuarzo y mobiliario lacado.',
            budget: 18000,
            location: 'Malaga',
            timeline: '3 Semanas',
            categoryName: 'Cocinas',
          },
          {
            title: 'Dormitorio Principal Suite',
            description: 'Trabajo de interiorismo creando un oasis de descanso con vestidor.',
            budget: 22000,
            location: 'Barcelona',
            timeline: '4 Semanas',
            categoryName: 'Interiorismo',
          },
        ];

        for (const project of sampleProjects) {
          const { categoryName, ...data } = project;

          await strapi.documents('api::project.project').create({
            data: {
              ...data,
              category: categoryMap[categoryName] || categories[0].documentId,
            },
            status: 'published',
          });
        }
      }

      strapi.log.info('Seed process finished successfully!');
    } catch (error) {
      strapi.log.error(`Seed failed: ${error.message}`);
    }
  },
};
