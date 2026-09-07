{{- $work := where site.RegularPages "Section" "work" -}}
{{- $blog := where site.RegularPages "Section" "blog" -}}
# {{ site.Title }}

{{ site.Params.role }} at Stripe. I build product interfaces where clarity, trust, and the tiny details are not optional.

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

A decade of writing, archived with its original dates. Index: {{ with (site.GetPage "/blog").OutputFormats.Get "md" }}{{ .Permalink }}{{ end }}

{{ range first 10 $blog.ByDate.Reverse }}- {{ .Date.Format "2006" }}: [{{ .Title }}]({{ with .OutputFormats.Get "md" }}{{ .Permalink }}{{ end }})
{{ end }}
