# {{ .LinkTitle }}

{{ $posts := where .RegularPages "Section" "blog" }}{{ len $posts }} {{ if eq (len $posts) 1 }}article{{ else }}articles{{ end }} tagged {{ .LinkTitle }}.

[All tags]({{ with (site.GetPage "/tags").OutputFormats.Get "md" }}{{ .Permalink }}{{ end }}) · [All writing]({{ with (site.GetPage "/blog").OutputFormats.Get "md" }}{{ .Permalink }}{{ end }})

{{ range $posts.ByDate.Reverse }}## {{ .Title }}

{{ .Date.Format "2 January 2006" }}{{ with partial "markdown/tags.html" . }} · {{ . }}{{ end }}

{{ .Description }}

[Read article]({{ with .OutputFormats.Get "md" }}{{ .Permalink }}{{ end }}) · [Website]({{ .Permalink }})

{{ end }}
Source: {{ .Permalink }}
