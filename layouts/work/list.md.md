{{- $work := partial "selected-work-pages.html" . -}}
{{- $blog := where site.RegularPages "Section" "blog" -}}
# Work

I design and build complex interfaces, from AI workspaces to the tools designers use.

[Try the measurement example]({{ (site.GetPage "/work/invision").Permalink }}#measurement-demo)

## Selected work

{{ with hugo.Data.experience.stripe }}### {{ .company }}

{{ site.Params.role }} · {{ .period }}

{{ .summary }}

{{ range .projects }}- [{{ .name }}]({{ .url }}) — {{ .status }}
{{ end }}
{{ end }}
{{ range $work }}### {{ .Title }}

{{ .Params.role }}{{ with .Params.period }} · {{ . }}{{ end }}

{{ .Params.summary | default .Description }}

[Full case study]({{ with .OutputFormats.Get "md" }}{{ .Permalink }}{{ end }}) · [Website]({{ .Permalink }})

{{ end -}}
[About me]({{ (site.GetPage "/about").Permalink }})
