{{- $work := where site.RegularPages "Section" "work" -}}
{{- $blog := where site.RegularPages "Section" "blog" -}}
# {{ site.Title }}

{{ site.Params.role }} at Stripe. I build product interfaces and pay close attention to the small details.

- Web: {{ site.Home.Permalink }}
- Email: {{ site.Params.email }}
- GitHub: {{ site.Params.github }}
- LinkedIn: {{ site.Params.linkedin }}

## Selected work

{{ range $work }}### {{ .Title }}

{{ .Params.role }}{{ with .Params.period }} · {{ . }}{{ end }}

{{ .Params.summary | default .Description }}

Full case study: {{ with .OutputFormats.Get "md" }}{{ .Permalink }}{{ end }}

{{ end -}}
## Writing

Old posts, kept with their original dates. Index: {{ with (site.GetPage "/blog").OutputFormats.Get "md" }}{{ .Permalink }}{{ end }}

{{ range first 10 $blog.ByDate.Reverse }}- {{ .Date.Format "2006" }}: [{{ .Title }}]({{ with .OutputFormats.Get "md" }}{{ .Permalink }}{{ end }})
{{ end }}
