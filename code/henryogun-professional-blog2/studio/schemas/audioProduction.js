export default {
  name: 'audioProduction',
  title: 'Audio Production',
  type: 'document',
  fields: [
    {
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: (Rule) => Rule.required(),
    },
    {
      name: 'tag',
      title: 'Tag',
      type: 'string',
      options: { list: ['Station ID', 'Jingle', 'Song', 'Documentary', 'Audio Imaging', 'PSA', 'Promo Spot', 'Other'] },
    },
    {
      name: 'description',
      title: 'Description',
      type: 'text',
      rows: 3,
    },
    {
      name: 'date',
      title: 'Date / Period',
      type: 'string',
    },
    {
      name: 'images',
      title: 'Images',
      type: 'array',
      of: [{ type: 'image', options: { hotspot: true } }],
    },
    {
      name: 'audioFiles',
      title: 'Audio Files',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            { name: 'label', title: 'Label', type: 'string' },
            { name: 'file', title: 'Audio File', type: 'file' },
          ],
        },
      ],
    },
    {
      name: 'videoFiles',
      title: 'Video Files',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            { name: 'label', title: 'Label', type: 'string' },
            { name: 'file', title: 'Video File', type: 'file' },
          ],
        },
      ],
    },
  ],
  preview: {
    select: { title: 'title', subtitle: 'tag' },
  },
};
