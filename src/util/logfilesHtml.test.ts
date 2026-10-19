import { logfilesHtml } from './logfilesHtml';

describe('logfilesHtml', () => {
	it('shows the failure reason first and each script of a log as its own block', () => {
		const html = logfilesHtml({
			message: 'Merging the results ran out of memory',
			submitStderr: 'sbatch: error',
			shFiles: { submit: '#!/bin/bash\n[ 1 < 2 ] && echo "ok"', collect: 'convertmc' }
		});

		expect(html).not.toContain('[object Object]');
		expect(
			html.startsWith('<p><strong>Merging the results ran out of memory</strong></p>')
		).toBe(true);
		expect(html).toContain('<h3 style="display: inline;">submit</h3>');
		expect(html).toContain(
			'<pre>#!/bin/bash\n[ 1 &lt; 2 ] &amp;&amp; echo &quot;ok&quot;</pre>'
		);

		expect(html).toContain(
			'<h3 style="display: inline;">collect</h3></summary><pre>convertmc</pre>'
		);
	});

	it('shows a failure reason stored as an error first', () => {
		expect(
			logfilesHtml({ log: 'merging', error: 'Merging the results ran out of memory' })
		).toBe(
			'<p><strong>Merging the results ran out of memory</strong></p>' +
				'<details><summary><h2 style="display: inline;">log</h2></summary><pre>merging</pre></details>'
		);
	});

	it('nests no heading deeper than h6', () => {
		const html = logfilesHtml({ a: { b: { c: { d: { e: { f: 'deep' } } } } } });

		expect(html).toContain('<h6 style="display: inline;">e</h6>');
		expect(html).toContain('<h6 style="display: inline;">f</h6>');
		expect(html).not.toContain('<h7');
	});

	it('shows the log files of a simulation run without an HPC cluster', () => {
		expect(logfilesHtml({ 'run_1.log': 'done' })).toBe(
			'<details><summary><h2 style="display: inline;">run_1.log</h2></summary><pre>done</pre></details>'
		);
	});
});
