{{- $work := partial "selected-work-pages.html" . -}}
{{- $blog := where site.RegularPages "Section" "blog" -}}
# Work

{{ with hugo.Data.experience.stripe }}I’m a {{ site.Params.role }} at {{ .company }}{{ with first 1 (where .projects "status" "Current") }}, currently working on {{ range . }}[{{ .name }}]({{ .url }}){{ end }}{{ end }}.{{ range first 1 (where .projects "status" "Previously") }} Previously, I worked on [{{ .name }}]({{ .url }}).{{ end }}
{{ end }}

[Try the measurement example]({{ (site.GetPage "/work/invision").Permalink }}#measurement-demo)

## Selected work

{{ range $work }}### {{ .Title }}

{{ .Params.role }}{{ with .Params.period }} · {{ . }}{{ end }}

{{ .Params.summary | default .Description }}

[Full case study]({{ with .OutputFormats.Get "md" }}{{ .Permalink }}{{ end }}) · [Website]({{ .Permalink }})

{{ end -}}
[About me]({{ (site.GetPage "/about").Permalink }})
