# Editing links and experience entries

Edit `_pages/about.md` to change the main content of your homepage.

## Text links

Use Markdown links in normal paragraphs:

```markdown
Advisor: [Prof. Bohan Zhuang](https://bohanzhuang.github.io/)
```

Inside raw HTML, use an HTML link:

```html
Advisor: <a href="https://bohanzhuang.github.io/">Prof. Bohan Zhuang</a>
```

## Experience with an institution logo

1. Upload the institution's logo to `images/` in this repository.
2. In `_pages/about.md`, replace the placeholder below `## Work Experience` with an entry like this.
3. Replace the example values with your own information and the exact uploaded filename.

```liquid
{% include experience-entry.html
  logo="/images/university-logo.png"
  institution="Institution Name"
  institution_url="https://example.edu/"
  dates="2025 – Present"
  role="Research Intern"
  details="Advisor: [Prof. Bohan Zhuang](https://bohanzhuang.github.io/)"
%}
```

Repeat the block for each experience. The same block also works under Education.
The sample institution, dates, and role are placeholders; they are not your biography.
PNG, JPG, and SVG files work. Transparent logos usually fit best.
Omit `logo` for a text-only entry and omit `institution_url` for an institution without a link.
Use Markdown links inside `details`. For several lines, use `<br>` in that value.

The layout places the logo on the left and the institution, dates, role, and advisor on the right.
Logos keep their aspect ratio and fit into a smaller column on phones.

## Sidebar accounts

Edit fields under `author` in `_config.yml`:

```yaml
email: zhangshiyuan66@126.com
twitter: ShiyuanZhang06
linkedin: shiyuan-zhang-915411440
googlescholar: 'https://scholar.google.com/citations?user=QWOYn6QAAAAJ'
xiaohongshu: 'https://www.xiaohongshu.com/user/profile/649fa68800000000100370ba'
```

The `twitter` field is displayed as X and links to x.com.
LinkedIn takes the profile slug, while Google Scholar and Xiaohongshu take full URLs.

Commit your changes to `main`. GitHub Pages will update the website automatically after a successful build.
