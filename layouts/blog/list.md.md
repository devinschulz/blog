# Thinking out loud.

Notes from the archive.

Notes on code, design, and the things I learned along the way.

{{ len .RegularPages }} articles, written between 2018 and 2022. Kept with their original publication dates.

## All writing

{{ range .RegularPages.ByDate.Reverse }}### {{ .Title }}

{{ .Date.Format "2 January 2006" }}{{ with .Params.tags }} · {{ delimit . ", " }}{{ end }}

{{ with .Description }}{{ . }}

{{ end }}[Read article]({{ with .OutputFormats.Get "md" }}{{ .Permalink }}{{ end }}) · [Website]({{ .Permalink }})

{{ end -}}
{{ with .OutputFormats.Get "rss" }}[RSS feed]({{ .Permalink }}){{ end }}

Source: {{ .Permalink }}
