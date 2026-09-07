# {{ .Title }}

{{ with .Description }}{{ . }}
{{ end }}
{{ range .RegularPages.ByDate.Reverse }}## {{ .Title }}

{{ .Date.Format "2 January 2006" }}{{ with .Params.tags }} · {{ delimit . ", " }}{{ end }}

{{ with .Description }}{{ . }}

{{ end }}Read: {{ with .OutputFormats.Get "md" }}{{ .Permalink }}{{ end }}

{{ end -}}
