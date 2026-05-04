export default {
  name: 'recentExperience',
  title: 'Recent Experience',
  type: 'document',
  fields: [
    {
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: (Rule) => Rule.required(),
    },
    {
      name: 'date',
      title: 'Date / Period',
      type: 'string',
    },
    {
      name: 'writeup',
      title: 'Write-up',
      type: 'text',
      rows: 5,
    },
    {
      name: 'images',
      title: 'Pictures',
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
            { name: 'file', title: 'File', type: 'file', options: { accept: 'audio/*' } },
          ],
          preview: { select: { title: 'label' } },
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
            { name: 'file', title: 'File', type: 'file', options: { accept: 'video/*' } },
          ],
          preview: { select: { title: 'label' } },
        },
      ],
    },
  ],
  orderings: [
    { title: 'Newest First', name: 'createdDesc', by: [{ field: '_createdAt', direction: 'desc' }] },
  ],
  preview: {
    select: { title: 'title', subtitle: 'date' },
  },
};
