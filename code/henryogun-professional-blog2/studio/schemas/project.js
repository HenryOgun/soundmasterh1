export default {
  name: 'project',
  title: 'Project',
  type: 'document',
  fields: [
    {
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: (Rule) => Rule.required(),
    },
    {
      name: 'pageType',
      title: 'Section',
      type: 'string',
      options: { list: ['broadcast', 'tech'] },
      validation: (Rule) => Rule.required(),
    },
    {
      name: 'tag',
      title: 'Tag',
      type: 'string',
      options: { list: ['Project', 'Award', 'Certification', 'Initiative'] },
    },
    {
      name: 'description',
      title: 'Short Description',
      type: 'text',
      rows: 3,
    },
    {
      name: 'date',
      title: 'Date / Period',
      type: 'string',
    },
    {
      name: 'readTime',
      title: 'Read Time (e.g. "4 min read")',
      type: 'string',
    },
    {
      name: 'image',
      title: 'Cover Image',
      type: 'image',
      options: { hotspot: true },
    },
    {
      name: 'content',
      title: 'Full Content',
      type: 'text',
    },
  ],
  preview: {
    select: { title: 'title', subtitle: 'pageType', media: 'image' },
  },
};
