interface templateValues {
    YEAR: string;
    CONTRIBUTORS: string;
    LICENSE: string;
    DoctypeName: string;
}

type templatePath =
    | "controller_doctype_ts.txt"
    | "client_doctype_ts.txt"
    | "report_doctype_ts.txt";

export type { templateValues, templatePath };
