{{- /* Export current page prose. Article bodies and code examples stay intact. */ -}}
# {{ .Title }}
{{ with .Params.headline }}
> {{ . }} {{ $.Params.headlineAccent }}
{{ end }}
{{- if eq .Section "blog" }}
{{ .Date.Format "2 January 2006" }}{{ with .Params.tags }} · {{ delimit . ", " }}{{ end }}

{{ with .Description }}{{ . }}

{{ end }}{{ if .Params.archived }}Archived writing, published in {{ .Date.Format "2006" }}. I’ve fixed some grammar since, but otherwise it’s as I wrote it, so some details may have aged.
{{ end }}
---

{{ partial "markdown/article.html" . }}
{{- else }}
{{- with .Params.role }}
- Role: {{ . }}
{{- end }}
{{- with .Params.period }}
- Period: {{ . }}
{{- end }}
{{- range .Params.facts }}
- {{ .label }}: {{ .value }}
{{- end }}

{{ with .Params.summary }}{{ . }}
{{ end }}
{{ with .Params.hero }}
{{ partial "markdown/figure.html" . }}
{{ end }}
{{ with .Params.intro }}{{ . }}
{{ end }}
{{ with .Params.assistant }}
## 01 / Assistant: {{ .title }}

{{ .body }}
{{ range .notes }}
- **{{ .title }}** {{ .body }}
{{ end }}
{{ end }}
{{ range $index, $chapter := .Params.chapters }}
## {{ .number }} / {{ .name }}: {{ .title }}

{{ .description }}

{{ partial "markdown/figure.html" . }}
{{ range .notes }}
- **{{ .title }}** {{ .body }}
{{ end }}
{{ if and (eq $.File.ContentBaseName "invision") (eq $index 0) }}
### My contribution: {{ $.Params.editorial.contributionTitle | plainify }}

{{ trim $.RawContent "\n" }}

[Read the original engineering write-up]({{ with (site.GetPage "/blog/building-the-inspect-measurement-engine").OutputFormats.Get "md" }}{{ .Permalink }}{{ end }})

### Engineering notes
{{ range $.Params.decisions }}
- **{{ .title }}** {{ .body }}
{{ end }}
{{ end }}
{{ end }}
{{ if eq .File.ContentBaseName "invision" }}
## Which edges do you measure?

Two layers can sit apart, overlap, or fit inside one another. Separate layers use the gap between their nearest edges. Overlapping layers compare corresponding edges, while a contained layer uses the insets from its surrounding edges. Display zoom scales the drawing without changing the distances in design pixels.

[Try the interactive measurement example]({{ .Permalink }}#measurement-demo), a simplified demonstration of the approach behind the Inspect engine.
{{ end }}
{{ with .Params.workflow }}
## {{ $.Params.editorial.workflowTitle | plainify }}

{{ $.Params.editorial.workflowBody }}

{{ $.Params.editorial.workflowNote }}

{{ partial "markdown/figure.html" . }}
{{ end }}
{{ with .Params.sunset }}
## {{ .kicker }}: {{ .title | replaceRE "<br\\s*/?>" " " | plainify }}

{{ trim $.RawContent "\n" }}

{{ partial "markdown/figure.html" . }}
{{ end }}
{{ if and .RawContent .Params.editorial.contributionTitle (ne .File.ContentBaseName "invision") }}
## {{ .Params.editorial.contributionTitle | plainify }}

{{ trim .RawContent "\n" }}
{{ end }}
{{ with .Params.principles }}
## Principles
{{ range . }}
- **{{ .title }}** {{ .body }}
{{ end }}
{{ end }}
{{ with .Params.reflection }}
## {{ $.Params.editorial.reflectionTitle | plainify }}

{{ . }}
{{ end }}
{{ if eq .File.ContentBaseName "invision" }}
[Notes from the team, written in 2019]({{ with (site.GetPage "/blog/reflecting-on-four-years-of-remote-work").OutputFormats.Get "md" }}{{ .Permalink }}{{ end }})
{{ end }}
{{ with .Params.editorial.attribution }}
{{ . }}
{{ end }}
{{ with site.GetPage .Params.editorial.next }}
[Next case study: {{ .Title }}]({{ with .OutputFormats.Get "md" }}{{ .Permalink }}{{ end }})
{{ end }}
{{- end }}

---

Source: {{ .Permalink }}
