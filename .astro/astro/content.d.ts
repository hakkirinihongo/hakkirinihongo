declare module 'astro:content' {
	interface Render {
		'.mdx': Promise<{
			Content: import('astro').MarkdownInstance<{}>['Content'];
			headings: import('astro').MarkdownHeading[];
			remarkPluginFrontmatter: Record<string, any>;
			components: import('astro').MDXInstance<{}>['components'];
		}>;
	}
}

declare module 'astro:content' {
	interface RenderResult {
		Content: import('astro/runtime/server/index.js').AstroComponentFactory;
		headings: import('astro').MarkdownHeading[];
		remarkPluginFrontmatter: Record<string, any>;
	}
	interface Render {
		'.md': Promise<RenderResult>;
	}

	export interface RenderedContent {
		html: string;
		metadata?: {
			imagePaths: Array<string>;
			[key: string]: unknown;
		};
	}
}

declare module 'astro:content' {
	type Flatten<T> = T extends { [K: string]: infer U } ? U : never;

	export type CollectionKey = keyof AnyEntryMap;
	export type CollectionEntry<C extends CollectionKey> = Flatten<AnyEntryMap[C]>;

	export type ContentCollectionKey = keyof ContentEntryMap;
	export type DataCollectionKey = keyof DataEntryMap;

	type AllValuesOf<T> = T extends any ? T[keyof T] : never;
	type ValidContentEntrySlug<C extends keyof ContentEntryMap> = AllValuesOf<
		ContentEntryMap[C]
	>['slug'];

	/** @deprecated Use `getEntry` instead. */
	export function getEntryBySlug<
		C extends keyof ContentEntryMap,
		E extends ValidContentEntrySlug<C> | (string & {}),
	>(
		collection: C,
		// Note that this has to accept a regular string too, for SSR
		entrySlug: E,
	): E extends ValidContentEntrySlug<C>
		? Promise<CollectionEntry<C>>
		: Promise<CollectionEntry<C> | undefined>;

	/** @deprecated Use `getEntry` instead. */
	export function getDataEntryById<C extends keyof DataEntryMap, E extends keyof DataEntryMap[C]>(
		collection: C,
		entryId: E,
	): Promise<CollectionEntry<C>>;

	export function getCollection<C extends keyof AnyEntryMap, E extends CollectionEntry<C>>(
		collection: C,
		filter?: (entry: CollectionEntry<C>) => entry is E,
	): Promise<E[]>;
	export function getCollection<C extends keyof AnyEntryMap>(
		collection: C,
		filter?: (entry: CollectionEntry<C>) => unknown,
	): Promise<CollectionEntry<C>[]>;

	export function getEntry<
		C extends keyof ContentEntryMap,
		E extends ValidContentEntrySlug<C> | (string & {}),
	>(entry: {
		collection: C;
		slug: E;
	}): E extends ValidContentEntrySlug<C>
		? Promise<CollectionEntry<C>>
		: Promise<CollectionEntry<C> | undefined>;
	export function getEntry<
		C extends keyof DataEntryMap,
		E extends keyof DataEntryMap[C] | (string & {}),
	>(entry: {
		collection: C;
		id: E;
	}): E extends keyof DataEntryMap[C]
		? Promise<DataEntryMap[C][E]>
		: Promise<CollectionEntry<C> | undefined>;
	export function getEntry<
		C extends keyof ContentEntryMap,
		E extends ValidContentEntrySlug<C> | (string & {}),
	>(
		collection: C,
		slug: E,
	): E extends ValidContentEntrySlug<C>
		? Promise<CollectionEntry<C>>
		: Promise<CollectionEntry<C> | undefined>;
	export function getEntry<
		C extends keyof DataEntryMap,
		E extends keyof DataEntryMap[C] | (string & {}),
	>(
		collection: C,
		id: E,
	): E extends keyof DataEntryMap[C]
		? Promise<DataEntryMap[C][E]>
		: Promise<CollectionEntry<C> | undefined>;

	/** Resolve an array of entry references from the same collection */
	export function getEntries<C extends keyof ContentEntryMap>(
		entries: {
			collection: C;
			slug: ValidContentEntrySlug<C>;
		}[],
	): Promise<CollectionEntry<C>[]>;
	export function getEntries<C extends keyof DataEntryMap>(
		entries: {
			collection: C;
			id: keyof DataEntryMap[C];
		}[],
	): Promise<CollectionEntry<C>[]>;

	export function render<C extends keyof AnyEntryMap>(
		entry: AnyEntryMap[C][string],
	): Promise<RenderResult>;

	export function reference<C extends keyof AnyEntryMap>(
		collection: C,
	): import('astro/zod').ZodEffects<
		import('astro/zod').ZodString,
		C extends keyof ContentEntryMap
			? {
					collection: C;
					slug: ValidContentEntrySlug<C>;
				}
			: {
					collection: C;
					id: keyof DataEntryMap[C];
				}
	>;
	// Allow generic `string` to avoid excessive type errors in the config
	// if `dev` is not running to update as you edit.
	// Invalid collection names will be caught at build time.
	export function reference<C extends string>(
		collection: C,
	): import('astro/zod').ZodEffects<import('astro/zod').ZodString, never>;

	type ReturnTypeOrOriginal<T> = T extends (...args: any[]) => infer R ? R : T;
	type InferEntrySchema<C extends keyof AnyEntryMap> = import('astro/zod').infer<
		ReturnTypeOrOriginal<Required<ContentConfig['collections'][C]>['schema']>
	>;

	type ContentEntryMap = {
		"articoli": {
"aggettivi-na-giapponese-origine-storia.mdx": {
	id: "aggettivi-na-giapponese-origine-storia.mdx";
  slug: "aggettivi-na-giapponese-origine-storia";
  body: string;
  collection: "articoli";
  data: any
} & { render(): Render[".mdx"] };
"arigatou-gozaimasu.mdx": {
	id: "arigatou-gozaimasu.mdx";
  slug: "arigatou-gozaimasu";
  body: string;
  collection: "articoli";
  data: any
} & { render(): Render[".mdx"] };
"differenza-ato-de-ato-ni-ato-wa-giapponese.mdx": {
	id: "differenza-ato-de-ato-ni-ato-wa-giapponese.mdx";
  slug: "differenza-ato-de-ato-ni-ato-wa-giapponese";
  body: string;
  collection: "articoli";
  data: any
} & { render(): Render[".mdx"] };
"differenza-hantai-hankou-teikou-tairitsu-sakarau-grammatica-giapponese.mdx": {
	id: "differenza-hantai-hankou-teikou-tairitsu-sakarau-grammatica-giapponese.mdx";
  slug: "differenza-hantai-hankou-teikou-tairitsu-sakarau-grammatica-giapponese";
  body: string;
  collection: "articoli";
  data: any
} & { render(): Render[".mdx"] };
"differenza-junbi-youi-shitaku.mdx": {
	id: "differenza-junbi-youi-shitaku.mdx";
  slug: "differenza-junbi-youi-shitaku";
  body: string;
  collection: "articoli";
  data: any
} & { render(): Render[".mdx"] };
"differenza-kibun-choushi-taichou-guai.mdx": {
	id: "differenza-kibun-choushi-taichou-guai.mdx";
  slug: "differenza-kibun-choushi-taichou-guai";
  body: string;
  collection: "articoli";
  data: any
} & { render(): Render[".mdx"] };
"differenza-kuuki-kankyou-funiki-giapponese.mdx": {
	id: "differenza-kuuki-kankyou-funiki-giapponese.mdx";
  slug: "differenza-kuuki-kankyou-funiki-giapponese";
  body: string;
  collection: "articoli";
  data: any
} & { render(): Render[".mdx"] };
"differenza-taihan-daibubun-hotondo.mdx": {
	id: "differenza-taihan-daibubun-hotondo.mdx";
  slug: "differenza-taihan-daibubun-hotondo";
  body: string;
  collection: "articoli";
  data: any
} & { render(): Render[".mdx"] };
"differenza-tomoeru-tomowareru-tosareru-opinione-indiretta.mdx": {
	id: "differenza-tomoeru-tomowareru-tosareru-opinione-indiretta.mdx";
  slug: "differenza-tomoeru-tomowareru-tosareru-opinione-indiretta";
  body: string;
  collection: "articoli";
  data: any
} & { render(): Render[".mdx"] };
"forma-passata-aggettivale-grammatica-giapponese.mdx": {
	id: "forma-passata-aggettivale-grammatica-giapponese.mdx";
  slug: "forma-passata-aggettivale-grammatica-giapponese";
  body: string;
  collection: "articoli";
  data: any
} & { render(): Render[".mdx"] };
"kke-grammatica-giapponese-passato.mdx": {
	id: "kke-grammatica-giapponese-passato.mdx";
  slug: "kke-grammatica-giapponese-passato";
  body: string;
  collection: "articoli";
  data: any
} & { render(): Render[".mdx"] };
"koto-ni-wa-naranai-grammatica-giapponese.mdx": {
	id: "koto-ni-wa-naranai-grammatica-giapponese.mdx";
  slug: "koto-ni-wa-naranai-grammatica-giapponese";
  body: string;
  collection: "articoli";
  data: any
} & { render(): Render[".mdx"] };
"kyuu-ni-ikinari-totsuzen-differenza-grammatica-giapponese.mdx": {
	id: "kyuu-ni-ikinari-totsuzen-differenza-grammatica-giapponese.mdx";
  slug: "kyuu-ni-ikinari-totsuzen-differenza-grammatica-giapponese";
  body: string;
  collection: "articoli";
  data: any
} & { render(): Render[".mdx"] };
"mou-sudeni-differenza-uso-giapponese.mdx": {
	id: "mou-sudeni-differenza-uso-giapponese.mdx";
  slug: "mou-sudeni-differenza-uso-giapponese";
  body: string;
  collection: "articoli";
  data: any
} & { render(): Render[".mdx"] };
"ni-koshita-koto-wa-nai-significato-uso-differenza-giapponese.mdx": {
	id: "ni-koshita-koto-wa-nai-significato-uso-differenza-giapponese.mdx";
  slug: "ni-koshita-koto-wa-nai-significato-uso-differenza-giapponese";
  body: string;
  collection: "articoli";
  data: any
} & { render(): Render[".mdx"] };
"no-ka-domande-retoriche-congetture.mdx": {
	id: "no-ka-domande-retoriche-congetture.mdx";
  slug: "no-ka-domande-retoriche-congetture";
  body: string;
  collection: "articoli";
  data: any
} & { render(): Render[".mdx"] };
"qualcosa-qualcuno-giapponese-nanika-dareka-dokoka.mdx": {
	id: "qualcosa-qualcuno-giapponese-nanika-dareka-dokoka.mdx";
  slug: "qualcosa-qualcuno-giapponese-nanika-dareka-dokoka";
  body: string;
  collection: "articoli";
  data: any
} & { render(): Render[".mdx"] };
"saserareru-uso-emotivo.mdx": {
	id: "saserareru-uso-emotivo.mdx";
  slug: "saserareru-uso-emotivo";
  body: string;
  collection: "articoli";
  data: any
} & { render(): Render[".mdx"] };
"suffisso-me-significato-grammatica-giapponese.mdx": {
	id: "suffisso-me-significato-grammatica-giapponese.mdx";
  slug: "suffisso-me-significato-grammatica-giapponese";
  body: string;
  collection: "articoli";
  data: any
} & { render(): Render[".mdx"] };
"sumimasen-significato-grazie-differenza-arigatou.mdx": {
	id: "sumimasen-significato-grazie-differenza-arigatou.mdx";
  slug: "sumimasen-significato-grazie-differenza-arigatou";
  body: string;
  collection: "articoli";
  data: any
} & { render(): Render[".mdx"] };
"to-wa-kagiranai-dissezione-grammaticale.mdx": {
	id: "to-wa-kagiranai-dissezione-grammaticale.mdx";
  slug: "to-wa-kagiranai-dissezione-grammaticale";
  body: string;
  collection: "articoli";
  data: any
} & { render(): Render[".mdx"] };
"totemo-kanari-zuibun-differenza-avverbi-intensita-giapponese.mdx": {
	id: "totemo-kanari-zuibun-differenza-avverbi-intensita-giapponese.mdx";
  slug: "totemo-kanari-zuibun-differenza-avverbi-intensita-giapponese";
  body: string;
  collection: "articoli";
  data: any
} & { render(): Render[".mdx"] };
"wa-betsu-to-shite-dissezione-grammaticale.mdx": {
	id: "wa-betsu-to-shite-dissezione-grammaticale.mdx";
  slug: "wa-betsu-to-shite-dissezione-grammaticale";
  body: string;
  collection: "articoli";
  data: any
} & { render(): Render[".mdx"] };
};

	};

	type DataEntryMap = {
		
	};

	type AnyEntryMap = ContentEntryMap & DataEntryMap;

	export type ContentConfig = never;
}
