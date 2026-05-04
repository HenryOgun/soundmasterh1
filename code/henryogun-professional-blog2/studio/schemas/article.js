export default {
  name: 'article',
  title: 'Article',
  type: 'document',
  fields: [
    {
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: (Rule) => Rule.required(),
    },
    {
      name: 'category',
      title: 'Category',
      type: 'string',
      options: {
        list: ['Broadcast Engineering', 'Tech Education', 'Full-Stack Dev', 'Audio Production', 'Opinion'],
      },
    },
    {
      name: 'tag',
      title: 'Tag',
      type: 'string',
      options: {
        list: ['Article', 'Opinion', 'Tutorial', 'News'],
      },
    },
    {
      name: 'description',
      title: 'Short Description',
      type: 'text',
      rows: 3,
    },
    {
      name: 'publishedAt',
      title: 'Published Date',
      type: 'datetime',
    },
    {
      name: 'readTime',
      title: 'Read Time (e.g. "5 min read")',
      type: 'string',
    },
    {
      name: 'image',
      title: 'Cover Image',
      type: 'image',
      options: { hotspot: true },
    },
    {
      name: 'body',
      title: 'Body',
      type: 'array',
      of: [
        { type: 'block' },
        {
          type: 'image',
          options: { hotspot: true },
        },
      ],
    },
  ],
  preview: {
    select: { title: 'title', subtitle: 'publishedAt', media: 'image' },
  },
};
