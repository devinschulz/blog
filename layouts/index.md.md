{{- $work := partial "selected-work-pages.html" . -}}
{{- $blog := where site.RegularPages "Section" "blog" -}}
# {{ site.Title }}

> DESIGNER’S EYE. ENGINEER’S MIND.

Independent perspective. Design & frontend engineering.

Currently building at Stripe.

Thoughtfully designed. Carefully built.

## Selected work

{{ range $work }}### {{ .Title }}

{{ .Params.role }}{{ with .Params.period }} · {{ . }}{{ end }}

{{ .Params.summary | default .Description }}

[Full case study]({{ with .OutputFormats.Get "md" }}{{ .Permalink }}{{ end }}) · [Website]({{ .Permalink }})

{{ end -}}
## A little context

Designing and building for the web since 2012.

I’ve been building for the web since 2012, first as a designer and then as a frontend engineer.

Today I’m a {{ site.Params.role }} at Stripe. Before that, I designed and built an AI workspace at Cape, and worked on design tools at InVision.

[More about me]({{ site.Params.linkedin }})

## Thinking out loud.

Notes on code and design, {{ partial "writing-years.html" $blog }}.

{{ range first 4 $blog.ByDate.Reverse }}- {{ .Date.Format "2006" }}: [{{ .Title }}]({{ with .OutputFormats.Get "md" }}{{ .Permalink }}{{ end }})
{{ end }}
[All {{ len $blog }} articles]({{ with (site.GetPage "/blog").OutputFormats.Get "md" }}{{ .Permalink }}{{ end }})

## Let’s talk

Have something in mind? [{{ site.Params.email }}](mailto:{{ site.Params.email }})

- Website: {{ site.Home.Permalink }}
- GitHub: {{ site.Params.github }}
- LinkedIn: {{ site.Params.linkedin }}

This is my own site. Views on my work are my own.
