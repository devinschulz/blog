{{- /* Markdown rendering for language models. Case-study prose lives in front
matter, so it is reconstructed here; posts emit their original Markdown. */ -}}
# {{ .Title }}
{{ with .Params.headline }}
> {{ . }} {{ $.Params.headlineAccent }}
{{ end }}
{{- if eq .Section "blog" }}
{{ .Date.Format "2 January 2006" }}{{ with .Params.tags }} · {{ delimit . ", " }}{{ end }}

{{ with .Description }}{{ . }}

{{ end }}---

{{ trim .RawContent "\n" | replaceRE "\\]\\(/" (printf "](%s/" (strings.TrimSuffix "/" site.Home.Permalink)) }}
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
{{- with .Params.hero }}
Cover image: {{ .alt }}
{{ end }}
{{- with .Params.intro }}
## The shared thread

{{ . }}
{{ end }}
{{- with .Params.assistant }}
## 01 / Assistant: {{ .title }}

{{ .body }}
{{ range .notes }}
- **{{ .title }}** {{ .body }}
{{- end }}
{{ end }}
{{- range .Params.chapters }}
## {{ .number }} / {{ .name }}: {{ .title }}

{{ .description }}
{{ with .alt }}
Screenshot: {{ . }}
{{ end }}
{{- range .notes }}
- **{{ .title }}** {{ .body }}
{{- end }}
{{ end }}
{{- with .Params.decisions }}
## Engineering notes
{{ range . }}
- **{{ .title }}** {{ .body }}
{{- end }}
{{ end }}
{{- with .Params.workflow }}
## The wider workflow

{{ .caption }} Screenshot: {{ .alt }}
{{ end }}
{{- with .Params.sunset }}
## {{ .kicker }}

{{ trim $.RawContent "\n" }}
{{ end }}
{{- with .Params.principles }}
## Principles
{{ range . }}
- **{{ .title }}** {{ .body }}
{{- end }}
{{ end }}
{{- with .Params.reflection }}
## What I carry forward

{{ . }}
{{- end }}
{{- if and .RawContent (not .Params.sunset) }}
## Notes

{{ trim .RawContent "\n" }}
{{- end }}
{{- end }}

---

Source: {{ .Permalink }}
