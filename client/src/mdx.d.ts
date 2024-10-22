/* eslint-disable @typescript-eslint/no-explicit-any */
declare module '*.md' {
  let MDXComponent: (props: any) => JSX.Element;
  export default MDXComponent;
}
