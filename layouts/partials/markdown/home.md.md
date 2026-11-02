{{- $blog := where site.RegularPages "Section" "blog" -}}
# Writing

I’m Devin Schulz, a frontend engineer at Stripe. These are my notes on code, design, and the things I learn along the way.

{{ range $blog.ByDate.Reverse }}- {{ .Date.Format "2006-01-02" }}: [{{ .Title }}]({{ with .OutputFormats.Get "md" }}{{ .Permalink }}{{ end }})
{{ end }}

[Selected work]({{ (site.GetPage "/work").Permalink }}) · [About me]({{ (site.GetPage "/work").Permalink }}#about)
