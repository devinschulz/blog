# Writing

Notes on code, design, and the things I learned along the way.

{{ len .RegularPages }} articles, {{ partial "writing-years.html" .RegularPages }}.

## All writing

[Browse tags]({{ with (site.GetPage "/tags").OutputFormats.Get "md" }}{{ .Permalink }}{{ end }})

{{ range .RegularPages.ByDate.Reverse }}### {{ .Title }}

{{ .Date.Format "2 January 2006" }}{{ with partial "markdown/tags.html" . }} · {{ . }}{{ end }}

{{ with .Description }}{{ . }}

{{ end }}[Read article]({{ with .OutputFormats.Get "md" }}{{ .Permalink }}{{ end }}) · [Website]({{ .Permalink }})

{{ end -}}
{{ with .OutputFormats.Get "rss" }}[RSS feed]({{ .Permalink }}){{ end }}

Source: {{ .Permalink }}
