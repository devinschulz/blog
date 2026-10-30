{{- $work := partial "selected-work-pages.html" . -}}
{{- $blog := where site.RegularPages "Section" "blog" -}}
# {{ site.Title }}

> Making complex software feel simple.

I design and build complex interfaces, from AI workspaces to the tools designers use.

Senior Frontend Engineer at Stripe.

[Explore selected work]({{ site.Home.Permalink }}#work) · [Try the measurement example]({{ (site.GetPage "/work/invision").Permalink }}#measurement-demo)

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
## About

Designing and building for the web since 2012.

I came to frontend engineering through design. I still enjoy figuring out how an interface should behave as much as writing the code that makes it work.

At Cape, that meant designing and building an AI workspace. At InVision, it meant working on the tools designers and developers use together. I’ve also built my own apps for iPhone, iPad, and Mac, where every decision, from the first form to the end of support, was mine to make.

The work I tend to enjoy most is in the details: keeping a conversation readable as it grows, making a failed request recoverable, or getting a small interaction to behave the way you expect.

[How I approach frontend work]({{ (site.GetPage "/blog/the-hardest-part-of-frontend-development-isnt-writing-code").Permalink }})

## Writing

Notes on code and design, {{ partial "writing-years.html" $blog }}.

{{ range first 4 $blog.ByDate.Reverse }}- {{ .Date.Format "2006" }}: [{{ .Title }}]({{ with .OutputFormats.Get "md" }}{{ .Permalink }}{{ end }})
{{ end }}
[All {{ len $blog }} articles]({{ with (site.GetPage "/blog").OutputFormats.Get "md" }}{{ .Permalink }}{{ end }})

## Say hello

Always happy to compare notes. [{{ site.Params.email }}](mailto:{{ site.Params.email }})

- Website: {{ site.Home.Permalink }}
- GitHub: {{ site.Params.github }}
- LinkedIn: {{ site.Params.linkedin }}

This is my own site. Views on my work are my own.
