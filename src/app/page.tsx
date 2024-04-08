import { Container } from "./_components/container";
import { cairo, covered_by_your_grace } from "~/styles/fonts";

export default function HomePage() {
  return (
    <main className="dark:bg-light-dark flex flex-col items-center justify-center">
      <div className="my-12 h-full w-full bg-[url(/dots-bg.svg)] bg-repeat py-12 dark:bg-[url(/dots-bg-dark.svg)]">
        <Container>
          <div className="flex flex-col items-center justify-around gap-6 md:flex-row">
            <div>
              <p className={`${cairo.className} text-lg dark:text-white`}>
                commune ai
              </p>
              <h1 className="text-4xl font-bold xl:text-5xl dark:text-white">
                <span
                  className={`${covered_by_your_grace.className} text-5xl text-blue-500 xl:text-6xl`}
                >
                  Community{" "}
                </span>
                Proposals.
              </h1>
            </div>
          </div>
        </Container>
      </div>
    </main>
  );
}
