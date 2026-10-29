# Browse writing by tag

Find more articles about a topic.

{{ range .Data.Terms.Alphabetical }}- [{{ .Page.LinkTitle }}]({{ with .Page.OutputFormats.Get "md" }}{{ .Permalink }}{{ end }}): {{ len .Page.RegularPages }} {{ if eq (len .Page.RegularPages) 1 }}article{{ else }}articles{{ end }}
{{ end }}

[All writing]({{ with (site.GetPage "/blog").OutputFormats.Get "md" }}{{ .Permalink }}{{ end }})

Source: {{ .Permalink }}
